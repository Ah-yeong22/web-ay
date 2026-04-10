package ex3_Collections;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

//Collections 클래스
//컬렉션을 다룰 때 자주 쓰느 기능들을 static 메서드로 모아놓은 클래스
public class CollectionsExample {
	public static void main(String[] args) {
		List<Integer> numbers = new ArrayList<>();
		numbers.add(30);
		numbers.add(10);
		numbers.add(20);
		
		System.out.println(numbers);
		
		Collections.sort(numbers);//정렬
		System.out.println(numbers);
		
		List<String> fruits = new ArrayList<>();
		
		fruits.add("banana");
		fruits.add("apple");
		fruits.add("cherry");
		
		System.out.println(fruits);
		
		Collections.sort(fruits);
		System.out.println(fruits);
		
		//내림차순 정렬 
		//reverseOrder();
		Collections.sort(numbers, Collections.reverseOrder());
		System.out.println(numbers);
		
		//문자열은 사전순으로 정렬이됨
		
		//순서 뒤집기 
		//reverse();
		List<Integer> numbers2 = new ArrayList<>();
		numbers2.add(30);
		numbers2.add(10);
		numbers2.add(20);
		
		System.out.println(numbers2);
		Collections.reverse(numbers2);
		System.out.println(numbers2);
		
		//
	}
}
