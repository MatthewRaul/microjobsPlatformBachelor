package com.licenta.microjobsPlatform.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licenta.microjobsPlatform.dto.LocationSuggestionDto;

@Service
public class GeoNamesService {

    @Value("${geonames.username}")
    private String username;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<LocationSuggestionDto> searchCitiesInRomania(String query) {
        try {
            String url = "http://api.geonames.org/searchJSON"
                    + "?name_startsWith=" + query
                    + "&country=RO"
                    + "&featureClass=P"
                    + "&maxRows=10"
                    + "&style=FULL"
                    + "&username=" + username;

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode geonames = root.get("geonames");

            List<LocationSuggestionDto> results = new ArrayList<>();

            if (geonames != null && geonames.isArray()) {
                for (JsonNode node : geonames) {
                    String location = node.has("name") ? node.get("name").asText() : null;
                    String county = node.has("adminName1") ? node.get("adminName1").asText() : null;

                    if (location == null || location.isBlank()) {
                        continue;
                    }

                    if (!location.toLowerCase().startsWith(query.toLowerCase())) {
                        continue;
                    }

                    if (county != null) {
                        county = county.replace(" County", "").trim();
                    }

                    results.add(new LocationSuggestionDto(location, county));
                }
            }

            return results;
        } catch (Exception e) {
            throw new RuntimeException("Nu s-au putut prelua locațiile din GeoNames.", e);
        }
    }
}
