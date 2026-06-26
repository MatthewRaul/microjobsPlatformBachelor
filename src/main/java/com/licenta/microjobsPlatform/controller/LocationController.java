package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.dto.LocationSuggestionDto;
import com.licenta.microjobsPlatform.service.GeoNamesService;

@RestController
public class LocationController {

    private final GeoNamesService geoNamesService;

    public LocationController(GeoNamesService geoNamesService) {
        this.geoNamesService = geoNamesService;
    }

    @GetMapping("/api/locations/search")
    public List<LocationSuggestionDto> searchLocations(@RequestParam String query) {
        return geoNamesService.searchCitiesInRomania(query);
    }
}
