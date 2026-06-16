# =========================================================
# Stage 1: Dynamic Java Spring Boot Source Maven Compilation
# =========================================================
FROM maven:3.8.8-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependency profiles first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy all source assets and run maven package compilation
COPY src ./src
RUN mvn package -DskipTests -B

# =========================================================
# Stage 2: Ultra slim ready-to-run container environment
# =========================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user for security compliance standard
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Retrieve compiled artifact jar
COPY --from=build /app/target/ems-*.jar ./app.jar

# Adjust local ownership to match non-root runner limits
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
