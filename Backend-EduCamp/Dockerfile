# Backend-EduCamp/Dockerfile
# Multi-stage build for Spring Boot backend (Java 21)
# Builds the jar with Maven then runs it on a small JRE image.
# Do NOT bake secrets into the image. Provide PAYPAL and SMTP creds at runtime.

# Stage 1 - build
FROM maven:3.9.5-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Copy only pom first for layer caching of dependencies
COPY pom.xml .
RUN mvn -B -T1C dependency:go-offline || true

# Copy sources and build
COPY src ./src
RUN mvn -B -DskipTests package

# Stage 2 - runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Optional runtime JVM options
ENV JAVA_OPTS=""

# Copy the fat/executable jar (adjust if your artifact name differs)
COPY --from=builder /workspace/target/*.jar /app/app.jar

# Expose default port (the platform will provide PORT at runtime)
EXPOSE 8081

# Entrypoint uses PORT env var if supplied; defaults to 8081
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8081} -jar /app/app.jar"]