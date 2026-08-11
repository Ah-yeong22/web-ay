package ex_0722.cohension;

public class ControCouplingExample {

	static class OrderService{
		public double calculateprice(double price,boolean isVIP) {
			if(isVIP) {
				return price *0.8;
			}else {
				return price;
			}
		}
	}
}
