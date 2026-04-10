package exma0410;

public class DiscountCalculator {
	   public static void main(String[] args) {
	       int price = 10000;
	       String grade = "VIP";
	       int discountedPrice = 0;
	 

	       if (grade.equals("VIP")) { 
	           discountedPrice =((int) (price * 0.8));
	       } else if (grade.equals("GOLD")) {
	    	   discountedPrice =(int)(price * 0.9);
	       }else {
	    	   discountedPrice = price;
	       }
	       System.out.println("최종 할인된 금액 : " + discountedPrice);

	      

	   }
	}
 