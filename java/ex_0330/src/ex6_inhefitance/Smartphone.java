package ex6_inhefitance;

//상속을 받는쪽이 상속을 하는쪽을 선택한다.
//extends 키워드를 통해 상속받을 클래스를 선택한다.
public class Smartphone extends Phone{
	
	public boolean wifi;
	
	public Smartphone(String model, String color) {
		super(model,color);
		
	}
	
	public void setWifi(boolean wifi) {
		this.wifi = wifi;
		System.out.println("'와이파이 상태 변경");
	}
	public void internet() {
		System.out.println("인터넷 연결");
	}

}
