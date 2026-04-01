package ex1_abstract;

public class Taxi extends Transport {

	int distance;
	int farePerKm;
	
	public Taxi(String name,int baseFare,int distance, int farePerKm) {
		super(name,baseFare);
		this.distance = distance;
		this.farePerKm = farePerKm;
	}
	@Override
	int calculateFare() {
		return baseFare + (distance * farePerKm);
	}
}
