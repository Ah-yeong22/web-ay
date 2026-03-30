package ex1_final;

public class Discount {
	static final double RATE_HIGHT = 0.2;
	static final double RATE_MID = 0.1;
	static final double RATE_LOW = 0.05;
	
	public int disCountRate (int money) {
		double discount;
		if (money >= 100000) {
			discount = money * RATE_HIGHT;
		}else if (money >=50000) {
			discount = money * RATE_MID;
		}else{
			discount  = money * RATE_LOW;
		}
		 return money - (int)discount;
	}
	
}
