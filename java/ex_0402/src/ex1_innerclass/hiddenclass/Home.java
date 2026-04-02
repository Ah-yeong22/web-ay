package ex1_innerclass.hiddenclass;

public class Home {

	//인터페이스의 객체는 직접 만들 수 없음
	//인터페이스를 구현하는 클래스를 만들어 객체로 사용해야 함 
	private RemoteControl rc = new RemoteControl() {
		public void turnOn() {
			System.out.println("tv를 켰습니다. ");
		};
		public void turnOff() {
			System.out.println("티비 끔");
		}
	};
	
	public void use1() {
		rc.turnOff();
		rc.turnOn();
	}
	
	public void use2() {
		RemoteControl rc = new RemoteControl() {
			@Override
			public void turnOff() {
				// TODO Auto-generated method stub
				super.turnOff();
			}
			@Override
			public void turnOn() {
				// TODO Auto-generated method stub
				super.turnOn();
			}
		};
		rc.turnOff();
		rc.turnOn();
	};
	
	public void use3(RemoteControl rc) {
		rc.turnOff();
		rc.turnOn();
	}
	
}
