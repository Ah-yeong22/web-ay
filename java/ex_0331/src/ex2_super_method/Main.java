package ex2_super_method;

public class Main {
	public static void main(String[] args) {
		SuperSonicAirplane s = new SuperSonicAirplane();
		s.takeOff();
		s.fly();
		s.flyMode = SuperSonicAirplane.SUPERSONIC;
		s.fly();
		s.flyMode = SuperSonicAirplane.NORMAL;
		s.fly();
		s.land();
		
		
	}
	
	
	
	
}
