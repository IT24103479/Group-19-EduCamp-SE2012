package com.example.Edu_Camp.config;

import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.services.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;
import java.util.Set;

import java.io.IOException;
import java.util.List;
@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    // DEV writable public patterns (optional)
    private static final List<String> DEV_PUBLIC_WRITE_PATTERNS = List.of(
            "/dev/public/**",
            "/api/dev/**",
            "/classes",
            "/teachers",
            "/payments",
            "/enrollments",
            "/api/classes",
            "/api/teachers",
            "/api/payments",
            "/api/enrollments"
    );

    private static final List<String> PUBLIC_GET_PATTERNS = List.of(
            "/subjects/**",
            "/api/subjects/**",
            "/api/subjects",
            "/subjects",
            "/classes/**",
            "/api/classes/**",
            "/api/classes",
            "/classes",
            "/teachers/**",
            "/api/teachers/**",
            "/api/teachers",
            "/payments/**",
            "/api/payments/**",
            "/api/payments",
            "/api/enrollments",
            "/api/enrollments/**",
            "/api/enrollments/class/**",
            "/users/**",
            "/api/admin/**",
            "/admin/**",
            "/admin/enrollments/**"
    );

    private final SessionService sessionService;
    private static final Logger logger = LoggerFactory.getLogger(SessionAuthenticationFilter.class);
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    public SessionAuthenticationFilter(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (isPublicEndpoint(request)) {
            logger.debug("Public endpoint - skipping authentication: {} {}", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String sessionId = extractSessionId(request);
        if (sessionId == null) {
            logger.warn("Missing session ID for: {} {}", request.getMethod(), request.getRequestURI());
            sendUnauthorizedError(response, "Missing session ID");
            return;
        }

        if (!sessionService.isValidSession(sessionId)) {
            logger.warn("Invalid session: {} for: {} {}", sessionId, request.getMethod(), request.getRequestURI());
            sendUnauthorizedError(response, "Invalid or expired session");
            return;
        }

        // Set SecurityContext for valid session
        User user = sessionService.getUserFromSession(sessionId);
        if (user != null) {
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.debug("Authenticated user '{}' with role '{}' for {}", user.getEmail(), user.getRole(), request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        logger.debug("Checking if endpoint is public: {} {}", method, path);

        if ("OPTIONS".equalsIgnoreCase(method)) return true;
        if ((path.startsWith("/api/auth/register") && "POST".equalsIgnoreCase(method))
                || (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(method))
                || path.startsWith("/public/")
                || path.equals("/error")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/webjars/")) {
            return true;
        }

        // Public GET paths
        if ("GET".equalsIgnoreCase(method)) {
            for (String pattern : PUBLIC_GET_PATTERNS) {
                if (pathMatcher.match(pattern, path)) {
                    logger.debug("Matched public pattern (GET): {} for path: {}", pattern, path);
                    return true;
                }
            }
        }

        // Public POST/PUT/DELETE dev paths
        if (("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))
                && !DEV_PUBLIC_WRITE_PATTERNS.isEmpty()) {
            for (String pattern : DEV_PUBLIC_WRITE_PATTERNS) {
                if (pathMatcher.match(pattern, path)) {
                    logger.debug("Matched dev public pattern (write): {} for path: {}", pattern, path);
                    return true;
                }
            }
        }

        logger.debug("No public pattern matched for: {} {}", method, path);
        return false;
    }

    private String extractSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("sessionId".equals(cookie.getName())) {
                    logger.debug("Extracted session ID from cookie");
                    return cookie.getValue();
                }
            }
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            logger.debug("Extracted session ID from Authorization header");
            return authHeader.substring(7);
        }

        String sessionHeader = request.getHeader("X-Session-Id");
        if (sessionHeader != null) {
            logger.debug("Extracted session ID from X-Session-Id header");
            return sessionHeader;
        }

        logger.debug("No session ID found in request");
        return null;
    }

    private void sendUnauthorizedError(HttpServletResponse response, String message)
            throws IOException {
        logger.warn("Sending unauthorized error: {}", message);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"success\": false, \"message\": \"%s\"}", message));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip filter for public endpoints - use the same logic as isPublicEndpoint
        return isPublicEndpoint(request);
    }
}