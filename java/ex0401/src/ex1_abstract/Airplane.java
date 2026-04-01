package ex1_abstract;

public class Airplane extends Transport {
	
	int airportFee;
	int fuelCharge;
	
	public Airplane(String name,int baseFare,int airportFee,int fuelCharge) {
		super(name,baseFare);
		this.airportFee=airportFee;
		this.fuelCharge=fuelCharge;
	}
	
	@Override
	int calculateFare() {
		return (baseFare + airportFee + fuelCharge);
	}

}
