package com.licenta.microjobsPlatform.exception;

import java.time.LocalDateTime;

import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.licenta.microjobsPlatform.dto.ApiError;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
 
    @ExceptionHandler(ResourceNotFound.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFound ex,HttpServletRequest request){
        ApiError error=new ApiError(
            ex.getMessage(),
            "Not found",
            request.getRequestURI(),
            HttpStatus.NOT_FOUND.value(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ForbiddenAction.class)
    public ResponseEntity<ApiError> handleForbidden(ForbiddenAction ex,HttpServletRequest request){
        ApiError error=new ApiError(
            ex.getMessage(),
            "Forbidden",
            request.getRequestURI(),
            HttpStatus.FORBIDDEN.value(),
            LocalDateTime.now()
        );
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(BadRequest.class)
    public ResponseEntity<ApiError> handleBadRequestCustom(BadRequest ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                ex.getMessage(),
                "Bad Request",
                request.getRequestURI(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                ex.getMessage(),
                "Bad Request",
                request.getRequestURI(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                ex.getMessage(),
        "Internal Server Error",
                request.getRequestURI(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }



}