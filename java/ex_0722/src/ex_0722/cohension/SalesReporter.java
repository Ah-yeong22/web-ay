package ex_0722.cohension;

public class SalesReporter {

	public void generateReport(double[] salesData) {
		
		double totalRevenue = clculrateTotalRevenue(salesData);
		double taxAmount = calculrateTax(salesData);
	}
	
	public double calculrateTotalRevenue(double[] salesData) {
		
	}
	
	public double calculrateTax(double[] salesData) {
		return calculrateTotalRevenue(salesData)*0.1;
	}
}
