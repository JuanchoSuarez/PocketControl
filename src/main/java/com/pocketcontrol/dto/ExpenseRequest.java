package com.pocketcontrol.dto;

// DTO para registrar un gasto con texto libre
public class ExpenseRequest {
    private String text; // ej: "café 3500" o "transmilenio 2950"

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
