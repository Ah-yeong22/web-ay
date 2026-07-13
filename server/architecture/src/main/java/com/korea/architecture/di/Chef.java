package com.korea.architecture.di;

import org.springframework.beans.factory.annotation.Autowired;

public class Chef {

	@Autowired
	private Knife knife;
	
	@Autowired
	public void setKnife(Knife knife) {
		this.knife = knife;
	}
	
	public void cook() {
		System.out.println("요리를 시작합니다.");
		knife.cut();
	}
}
