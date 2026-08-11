package com.korea.ex_0722.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.ex_0722.service.UserService;
import com.korea.ex_0722.vo.UserVO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;
	
	@GetMapping
	public List<UserVO> findAll(){
		return userService.findAll();
	}
	
	@GetMapping("{id}")
	public 
}
