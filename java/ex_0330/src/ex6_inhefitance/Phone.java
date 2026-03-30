package ex6_inhefitance;

public class Phone {
	public String model;
	public String color;
	
	public Phone(String model, String color) {
		this.model = model;
		this.color = color;
		System.out.println("Phone() 생성자 실행" );
	}
	
	public void bell() {
		System.out.println("벨벨벨");
	}
	public void sendMessage(String message) {
		System.out.println("나 " + message);
	}
	public void receiveMessage(String message) {
		System.out.println("상대방 " + message);
	}
	public void hangUp () {
		System.out.println("전화 끊어라 " );
	}
}
