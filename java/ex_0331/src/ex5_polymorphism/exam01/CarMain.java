package ex5_polymorphism.exam01;

public class CarMain {
	public static void main(String[] args) {
		Car c = new Car();
		
		c.tire = new Tire();
		
		c.run();
		
		//한국타이어로 교체
		c.tire = new HankookTire();
		c.run();
		
		//금호타이어로 교체
		c.tire = new Kumho();
		c.run();
		
	}
}
