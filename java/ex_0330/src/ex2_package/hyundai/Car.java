package ex2_package.hyundai;

import ex2_package.hankook.SnowTire;
import ex2_package.kumho.AllseasonTire;
public class Car {
	//타이어 피료행
	
		//클래스의 정체 경로를 다 작성해줬기 때문에 import 를 써주지 않아도 됨
		ex2_package.hankook.Tire tire1 = new ex2_package.hankook.Tire();
		ex2_package.kumho.Tire tire2 = new ex2_package.kumho.Tire();
		SnowTire tire3 = new SnowTire();
		AllseasonTire tire4 = new AllseasonTire();
}
