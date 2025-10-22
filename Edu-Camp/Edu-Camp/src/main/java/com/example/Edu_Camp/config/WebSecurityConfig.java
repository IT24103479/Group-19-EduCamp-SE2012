package com.example.Edu_Camp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final SessionAuthenticationFilter sessionAuthenticationFilter;

    @Autowired
    public WebSecurityConfig(SessionAuthenticationFilter sessionAuthenticationFilter) {
        this.sessionAuthenticationFilter = sessionAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
// (replace only the authorizeHttpRequests(...) part in your existing class)
                .authorizeHttpRequests(authz -> authz
                        // Allow GET (fetch) without auth for resource endpoints:
                        .requestMatchers(HttpMethod.GET,
                                "/subjects/**",
                                "/classes/**",
                                "/teachers/**",
                                "/payments/**",
                                "/users/**",
                                "/api/admin/**",
                                "/api/enrollments/**",
                                "/educamp/api/enrollments/**"
                        ).permitAll()

                        // Allow POST login/register and other non-GET public endpoints
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register/**",
                                "/public/**",
                                "/error",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/webjars/**",
                                "/api/payments/",
                                "/api/payments/capture/"
                        ).permitAll()

                        // Authenticated endpoints - require valid session but no specific role
                        .requestMatchers(
                                "/api/auth/me",
                                "/api/auth/logout"
                        ).authenticated()

                        // Protected dashboards
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .requestMatchers("/dashboard/**").authenticated()

                        // Role-based access
                        .requestMatchers("/api/students/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers("/api/teachers/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/admins/**").hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                // Keep the custom session filter, but make sure it skips public paths (see filter changes)
                .addFilterBefore(sessionAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}