package com.pocketcontrol.dto;

public class ExpenseRequest {
    private String text;
    private String category;
    private String categoryIcon;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
}
