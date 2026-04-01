package ex2_interface;

public class InterfaceMain {
	public static void main(String[] args) {
		//인터페이스도 하나의 타입이기 때문에 변수의 타입으로 사용할 수 있다.
		
		
		RemoteControl rc;
		rc = new Television();
		rc.turnOn();
		
		Television tv = new Television();
		
		//rc변수에 Audio객체로 교체할 수 있다.
		rc = new Audio();
		rc.turnOn();
		
		System.out.println("최대볼륨 : "+ RemoteControl.MAX_VOLUME);
		System.out.println("최대볼륨 : "+ RemoteControl.MIN_VOLUME);
		
		rc.setVolume(5);
		rc.setMute(true);
		rc.setMute(false);
		
		RemoteControl.changeBattery();
		
		rc = new SmartTelevision();
		
		rc.turnOn();
		Searchable searchable = new SmartTelevision();
		searchable.search("https://www.youtube.com");
	}
}
