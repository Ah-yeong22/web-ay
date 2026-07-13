package com.korea.architecture.di;

import org.springframework.stereotype.Component;

@Component
public class KitchenKnife extends Knife {

    @Override
    public void cut() {
        System.out.println("주방용 칼로 재료를 손질합니다.");
    }
}