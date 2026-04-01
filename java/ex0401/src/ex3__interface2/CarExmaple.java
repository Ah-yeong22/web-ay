package ex3__interface2;

public class CarExmaple {

	public static void main(String[] args) {
		Car c = new Car();
		c.tire1 = new HankookTire();
		c.tire2 = new HankookTire();
		c.run();
		
		
		c.tire1 = new Kumho();
		c.tire2 = new Kumho();
		c.run();
	}
}
