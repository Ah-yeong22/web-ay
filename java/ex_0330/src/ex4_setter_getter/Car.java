package ex4_setter_getter;

public class Car {
	
	//private으로 선언된 필드는 외부에서 접근이 안된다. 
	private int speed;
	private boolean stop;
	
	//setter&getter
	//private으로 선언된 필드에 접근할 수 있돌고 해주는 메서드 
	
	public void setSpeed(int speed) {
		if(speed < 0) {
			this.speed = 0;
			return;
		}else {
			this.speed = speed;
		}
	}
	
	public int getSpeed() {
		return this.speed;
	}
	
	public void setStop(boolean stop) {
		this.stop = stop;
		if(stop == true) {
			this.speed = 0;
		}
	}
	
	public boolean isStop() {
		return this.stop;
	}
	
}
