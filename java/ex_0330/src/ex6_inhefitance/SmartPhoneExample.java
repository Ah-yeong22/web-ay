package ex6_inhefitance;

public class SmartPhoneExample {

	public static void main(String[] args) {
		Smartphone myPhone = new Smartphone("갤럭시", "블랙");
		
		System.out.println("모델 : " + myPhone.model);
		System.out.println("색상 : " + myPhone.color);
		
		System.out.println("와이파이 상태 :" + myPhone.wifi);
		
		//Phone으로부터 상속받은 메서드 호출
		myPhone.bell();
		myPhone.sendMessage("여보세요");
		myPhone.receiveMessage("안녕하쇼 저는 홍기리기리인데요");
		myPhone.sendMessage("예히");
		myPhone.hangUp();
		
		//SmartPhone의 메서드를 호출
		myPhone.setWifi(true);
		myPhone.internet();
	}
}
