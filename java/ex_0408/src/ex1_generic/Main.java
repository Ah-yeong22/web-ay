package ex1_generic;

public class Main {
	public static void main(String[] args) {
		//제네릭에 타입을 넣을 수 있는건 장점이지만 아무타입이나 넣어도 된다는것이 문제
		//어떤 기능을 만들 때는 특정 성질을 가진 타입만 받아야 안전하다는 문제가 생김
		//제네릭에 넣을 수 있는 타입의 범위를 한정 
		
		DeviceManager<Tv> tvManager = new DeviceManager<Tv>(new Tv());
		DeviceManager<Audio> AudioManager = new DeviceManager<Audio>(new Audio());
		
		tvManager.powerOn();
		AudioManager.powerOn(); 
		
		//Readable과 Closeablel을 동시에 구현한 클래스만이 타입 할당 가능
		Box<BoxType>box = new Box<>();
		
//		Box<Object> box2 = new Bos<>();
	}
}
