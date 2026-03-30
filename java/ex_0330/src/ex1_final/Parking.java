package ex1_final;

public class Parking {
	static final int PARKING = 10000;
	static final int ADD = 2000;
	
	
	public int calculateFee(int time) {
		return PARKING + (time * ADD);
	}
	
	
	
}
