package com.licenta.microjobsPlatform.exception;

public class ForbiddenAction extends RuntimeException {

    public ForbiddenAction(String message) {
        super(message);
    }
}
