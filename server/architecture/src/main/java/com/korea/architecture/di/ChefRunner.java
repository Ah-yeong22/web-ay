package com.korea.architecture.di;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

//@Component
public class ChefRunner implements CommandLineRunner{

	@Autowired
	private Chef chef;
	
	public void run(String...args) throws Exception {
		chef.cook();
	}
}
