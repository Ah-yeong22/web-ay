package exam;

import java.util.Arrays;
import java.util.List;

public class Product {
	
	String name;
	int price;
	
	public Product(String name,int price) {
		this.name = name;
		this.price=price;
	}
	public int getPrice() {
		return price;
	}
	public static void main(String[] args) {
		List<Integer> orders = Arrays.asList(12000, 80000, 45000, 50000, 99000, 30000);
		orders.stream()
		.filter(x -> x >= 50000)
		.forEach(x -> System.out.println(x+""));
		
		List<Integer> ages = Arrays.asList(21, 35, 17, 42, 63, 15);
		boolean result = ages.stream()
				.anyMatch(x -> x < 20);
		System.out.println("결과 : " + result);
		
		List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
		
		int sum = numbers.stream()
		.filter(x -> x%2==0)
		.mapToInt(x-> x*x)
		.sum();
		System.out.println(sum);
		
		List<Integer> scores = Arrays.asList(55, 90, 82, 67, 99, 80, 73);
		
		scores.stream()
		.sorted((a,b)->b-a)
		.forEach(x -> System.out.print(x+" "));
		
		List<Product> list = Arrays.asList(
				new Product("마우스", 8000),
                new Product("키보드", 30000),
                new Product("모니터", 150000),
                new Product("노트", 2000));
		
		list.stream()
		.filter(x -> x.getPrice()>=10000)
		.forEach(x -> System.out.println(x.getPrice()));
		
	}
	
	
	
}
