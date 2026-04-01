package ex1_abstract;

public abstract class Transport {

	String name;
	int baseFare;
	
	public Transport(String name, int baseFare) {
		this.name = name;
		this.baseFare = baseFare;
	}
	
	public String showName() {
		return name;
		
	}
	
	abstract int calculateFare();
	
	public void printFare() {
		System.out.println("교통수단 : " + showName());
		System.out.println("기본요금 : " + baseFare);
		System.out.println("총 요금 : " +calculateFare() );
	}
	
}
