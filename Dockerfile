# Stage 1: Build the application using Maven
FROM maven:3.9.12-eclipse-temurin-25 AS build
WORKDIR /home/app
COPY src /home/app/src
COPY pom.xml /home/app/
RUN mvn -f /home/app/pom.xml clean package -DskipTests

# Stage 2: Create the final lightweight runtime image
FROM eclipse-temurin:25.0.1_8-jre
WORKDIR /app
# Copy the JAR file from the 'build' stage to the new stage
COPY --from=build /home/app/target/*.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "infra-api-project-0.0.1-SNAPSHOT.jar"]
