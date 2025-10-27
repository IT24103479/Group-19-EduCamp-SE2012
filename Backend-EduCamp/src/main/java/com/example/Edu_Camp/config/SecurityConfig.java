package com.example.Edu_Camp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
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
public class SecurityConfig {

    private final SessionAuthenticationFilter sessionAuthenticationFilter;

    @Autowired
    public SecurityConfig(SessionAuthenticationFilter sessionAuthenticationFilter) {
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
                .authorizeHttpRequests(authz -> authz

                        // Public endpoints (all HTTP methods)
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register/**",
                                "/public/**",
                                "/error",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/webjars/**",
                                "/api/payments/**",
                                "/api/payments/capture/",
                                "/api/subjects/**",
                                "/api/subjects",
                                "/subjects/**",
                                "/subjects",
                                "/api/classes/**",
                                "/api/classes",
                                "/classes/**",
                                "/classes",
                                "/teachers/**",
                                "/api/teachers/**",
                                "/api/teachers",
                                "/users/**",
                                "/api/admin/**",
                                "/api/enrollments/**",
                                "/educamp/api/enrollments/**",
                                "/api/admin/enrollments/**",
                                "/admin/enrollments/**",
                                "/admin/**",
                                "/api/enrollments/class/**",
                                "/admin-teachers",
                                "/api/materials/**",
                                "/api/materials"
                        ).permitAll()

                        // Authenticated endpoints (any logged-in user)
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
                // Custom session filter
                .addFilterBefore(sessionAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);  // Using allowedOriginPatterns("*") allows credentials
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
