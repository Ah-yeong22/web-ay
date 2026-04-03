package ex1_exception.customException;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) throws IllegalArgumentException{
		Scanner sc = new Scanner(System.in);
		Converter2 converter = new Converter2();
		OrderService os = new OrderService();
		
		try {
			System.out.println("가격을 입력: ");
			String priceStr = sc.next();
			System.out.println("수량을 입력: ");
			String quantityStr = sc.next();
			
			int price = converter.str(priceStr);
			int quantity = converter.str(priceStr);
			
			int total = os.total(price, quantity);
			System.out.println(total);
				
		} catch (Exception e) {
			System.out.println("숫자변환 실패");
			}
	}
}
