package ex2_interface;

public class CastingExample {
	public static void main(String[] args) {
		//자동타입변환
		Vehicle vehicle = new Bus();
		
		vehicle.run();
		
		((Bus)vehicle).checkFare();
	}
}
