package br.com.dandaraemiliano.todolist.filter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import at.favre.lib.crypto.bcrypt.BCrypt;
import br.com.dandaraemiliano.todolist.user.IUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class FilterTaskAuth extends OncePerRequestFilter {

    @Autowired
    private IUserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getServletPath().startsWith("/tasks/")) {
            filterChain.doFilter(request, response);
            return;
        }

        var credentials = readCredentials(request.getHeader("Authorization"));
        if (credentials.length != 2) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        var user = userRepository.findByUsername(credentials[0]);
        if (user == null || !BCrypt.verifyer().verify(credentials[1].toCharArray(), user.getPassword()).verified) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        request.setAttribute("idUser", user.getId());
        filterChain.doFilter(request, response);
    }

    private String[] readCredentials(String header) {
        if (header == null || !header.regionMatches(true, 0, "Basic ", 0, 6)) {
            return new String[0];
        }
        try {
            var decoded = Base64.getDecoder().decode(header.substring(6).trim());
            return new String(decoded, StandardCharsets.UTF_8).split(":", 2);
        } catch (IllegalArgumentException ex) {
            return new String[0];
        }
    }
}
