package com.korea.architecture.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
//@RequestMapping("/test")
public class TestController {

    @GetMapping("/testGetMapping")
    public String testController() {
        return "Hello World";
    }
    
    @GetMapping("/testGetMapping2")
    public String testController2() {
    	return "Nice to meet you";
    }
    
//    @PathVariable
    @GetMapping("/users/{id}")
    public String getUserById(@PathVariable("id")Long userId) {
    	return "User ID : " + userId;
    }
    
    @GetMapping("/users/{id}/orders/{orderId}")
    public String order(
    		@PathVariable("id")Long userId,
    		@PathVariable("orderId")Long orderId) {
    	return "UserID :" + userId + ",order ID : " + orderId;
    	}
}