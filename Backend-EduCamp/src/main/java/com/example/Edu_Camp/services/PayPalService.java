package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.PaymentDTO;
import com.example.Edu_Camp.models.Payment;
import com.example.Edu_Camp.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * PayPal service responsible for obtaining OAuth token, creating orders, and capturing payments.
 * Improvements:
 * - Added logging to aid debugging.
 * - Uses List for purchase_units to avoid serialization quirks.
 * - Encodes orderId when building capture URL.
 * - Sends "{}" as capture body (PayPal expects empty JSON object).
 * - More robust error logging and HttpClientErrorException handling to capture PayPal error bodies.
 */
@Service
public class PayPalService {

    private static final Logger logger = LoggerFactory.getLogger(PayPalService.class);

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.secret}")
    private String secret;
    @Value("${frontend.url}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final PaymentRepository paymentRepository;

    public PayPalService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // 1️⃣ Get OAuth token from PayPal Sandbox
    public String getAccessToken() {
        String url = "https://api-m.sandbox.paypal.com/v1/oauth2/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = Base64.getEncoder().encodeToString((clientId + ":" + secret).getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + auth);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(url, request, Map.class);
        } catch (HttpClientErrorException he) {
            // Log detailed error from PayPal (401, 400 etc)
            logger.error("PayPal token request failed: status={}, body={}", he.getStatusCode(), he.getResponseBodyAsString());
            throw new RuntimeException("Failed to get PayPal token: " + he.getStatusCode() + " " + he.getResponseBodyAsString(), he);
        } catch (Exception e) {
            logger.error("Exception while requesting PayPal access token: {}", e.toString(), e);
            throw new RuntimeException("Failed to get PayPal token", e);
        }

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Object tokenObj = response.getBody().get("access_token");
            if (tokenObj != null) {
                String token = tokenObj.toString();
                logger.debug("Obtained PayPal access token (length={}): present", token.length());
                return token;
            } else {
                logger.error("PayPal token response missing access_token: {}", response.getBody());
                throw new RuntimeException("Failed to get PayPal token: missing access_token");
            }
        } else {
            logger.error("Failed to get PayPal token: status={}, body={}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to get PayPal token");
        }
    }

    // 2️⃣ Create PayPal Order and save Payment in DB
    public Payment createOrder(PaymentDTO paymentDTO) {
        String accessToken = getAccessToken();

        String url = "https://api-m.sandbox.paypal.com/v2/checkout/orders";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // Build order payload
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("intent", "CAPTURE");

        Map<String, Object> amount = new HashMap<>();
        amount.put("currency_code", paymentDTO.getCurrency());
        amount.put("value", String.format("%.2f", paymentDTO.getAmount()));

        Map<String, Object> purchaseUnit = new HashMap<>();
        purchaseUnit.put("amount", amount);
        if (paymentDTO.getDescription() != null) {
            purchaseUnit.put("description", paymentDTO.getDescription());
        }

        // Use List for purchase_units to avoid serialization oddities
        orderRequest.put("purchase_units", List.of(purchaseUnit));

        // Add return and cancel URLs BEFORE sending the request
        Map<String, Object> applicationContext = new HashMap<>();
        applicationContext.put("return_url", frontendUrl + "/payment-success?token="); // PayPal appends token
        applicationContext.put("cancel_url", frontendUrl + "/payment-cancel");
        orderRequest.put("application_context", applicationContext);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(orderRequest, headers);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(url, request, Map.class);
        } catch (HttpClientErrorException he) {
            logger.error("PayPal create order failed: status={}, body={}", he.getStatusCode(), he.getResponseBodyAsString());
            throw new RuntimeException("Failed to create PayPal order: " + he.getStatusCode() + " " + he.getResponseBodyAsString(), he);
        } catch (Exception e) {
            logger.error("Exception while creating PayPal order: {}", e.toString(), e);
            throw new RuntimeException("Failed to create PayPal order", e);
        }

        if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

            String orderId = Objects.toString(responseBody.get("id"), null);
            if (orderId == null) {
                logger.error("PayPal create order response missing id: {}", responseBody);
                throw new RuntimeException("Failed to create PayPal order: missing id");
            }

            // Extract approval link
            String approvalUrl = null;
            List<Map<String, Object>> links = (List<Map<String, Object>>) responseBody.get("links");
            if (links != null) {
                for (Map<String, Object> link : links) {
                    if ("approve".equals(link.get("rel"))) {
                        approvalUrl = link.get("href").toString();
                        break;
                    }
                }
            }

            // Save Payment entity
            Payment payment = new Payment();
            payment.setAmount(paymentDTO.getAmount());
            payment.setCurrency(paymentDTO.getCurrency());
            payment.setClassId(paymentDTO.getClassId());
            payment.setUserId(paymentDTO.getUserId());
            payment.setPaypalOrderId(orderId);
            payment.setPaymentCompleted(false);

            Payment savedPayment = paymentRepository.save(payment);

            // Attach approval URL (transient, not persisted)
            savedPayment.setApprovalUrl(approvalUrl);

            logger.info("Created PayPal order id={} for payment id={}", orderId, savedPayment.getId());
            return savedPayment;
        } else {
            logger.error("Failed to create PayPal order: status={}, body={}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to create PayPal order");
        }
    }

    // 3️⃣ Capture Payment after approval (optional)
    public Payment capturePayment(String paypalOrderId) {
        String accessToken = getAccessToken();

        // Encode order id to be safe (spaces or special chars)
        String encodedOrderId = URLEncoder.encode(paypalOrderId, StandardCharsets.UTF_8);
        String url = "https://api-m.sandbox.paypal.com/v2/checkout/orders/" + encodedOrderId + "/capture";

        logger.info("capturePayment called for paypalOrderId='{}' -> url='{}'", paypalOrderId, url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // PayPal expects an empty JSON object, not an empty string
        HttpEntity<String> request = new HttpEntity<>("{}", headers);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(url, request, Map.class);
        } catch (HttpClientErrorException he) {
            logger.error("PayPal capture failed: status={}, body={}", he.getStatusCode(), he.getResponseBodyAsString());
            throw new RuntimeException("Failed to capture PayPal payment: " + he.getStatusCode() + " " + he.getResponseBodyAsString(), he);
        } catch (Exception e) {
            logger.error("Exception calling PayPal capture for orderId='{}' url='{}' error: {}", paypalOrderId, url, e.toString(), e);
            throw new RuntimeException("Failed to capture PayPal payment", e);
        }

        logger.info("PayPal capture response: status={}, body={}", response.getStatusCode(), response.getBody());

        if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
            Map<String, Object> body = (Map<String, Object>) response.getBody();

            // Update payment in DB
            Payment payment = paymentRepository.findByPaypalOrderId(paypalOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for PayPal order id: " + paypalOrderId));
            payment.setPaymentCompleted(true);

            // Extract transaction ID if available
            List<Map<String, Object>> purchaseUnits = (List<Map<String, Object>>) body.get("purchase_units");
            if (purchaseUnits != null && !purchaseUnits.isEmpty()) {
                Map<String, Object> payments = (Map<String, Object>) purchaseUnits.get(0).get("payments");
                if (payments != null) {
                    List<Map<String, Object>> captures = (List<Map<String, Object>>) payments.get("captures");
                    if (captures != null && !captures.isEmpty()) {
                        Object captureId = captures.get(0).get("id");
                        if (captureId != null) {
                            payment.setPaypalTransactionId(captureId.toString());
                        }
                    }
                }
            }

            Payment saved = paymentRepository.save(payment);
            logger.info("Captured PayPal order id={} and updated payment id={}", paypalOrderId, saved.getId());
            return saved;
        } else {
            logger.error("Failed to capture PayPal payment for orderId='{}', status={}, body={}", paypalOrderId, response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to capture PayPal payment");
        }
    }
}