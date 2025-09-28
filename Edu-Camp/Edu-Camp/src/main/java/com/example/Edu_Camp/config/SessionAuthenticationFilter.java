package com.example.Edu_Camp.config;

import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.service.SessionService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final SessionService sessionService;

    public SessionAuthenticationFilter(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String sessionId = extractSessionId(request);

        if (sessionId != null) {
            User user = sessionService.getUserFromSession(sessionId);

            if (user != null) {
                var authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole())
                );

                var authentication = new UsernamePasswordAuthenticationToken(
                        user, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractSessionId(HttpServletRequest request) {
        // Check cookies
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("sessionId".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // Check header
        return request.getHeader("X-Session-Id");
    }
}