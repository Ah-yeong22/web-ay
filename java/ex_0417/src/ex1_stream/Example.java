package ex1_stream;

import java.util.Arrays;
import java.util.List;

public class Example {
	public static void main(String[] args) {
		List<Integer> numbers = Arrays.asList(3,5,7,8,10,4,1,2,6,9,1,1,2,2,2);
		
		//짝수만 골라 10을 더한 뒤 출력해라 
		
		numbers.stream()
		.filter(x -> x%2==0)
		.forEach(x -> System.out.println(x+10));
		
		List<String> words = Arrays.asList("java", "spring", "react", "db", "server");
		
		words.stream()
		.filter(x -> x.length() >=5)
		.map(x -> x.toUpperCase())
		.forEach(x -> System.out.println(x +""));
	}
}
