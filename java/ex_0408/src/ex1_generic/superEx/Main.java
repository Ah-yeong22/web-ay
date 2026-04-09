package ex1_generic.superEx;

import java.util.ArrayList;
import java.util.List;

public class Main {
	
	//Lits<? super Dog> list에서 허용되는 타입
	//List<Dog>,List<Animal>, List<Object>
	//<? super T>를 사용하는 큰 이유
	//T 타입을 안전하게 넣기 위해 사용
	public static void addDog(List<? super Dog> list) {
		list.add(new Dog());
		list.add(new Puppy());
	}
	public static void main(String[] args) {
		List<Animal> animalList = new ArrayList<Animal>();
		List<Dog> dogList = new ArrayList<Dog>();
		List<Puppy> puppyList = new ArrayList<Puppy>();
		addDog(animalList);
		addDog(dogList);
		
		//불가능(Puppy는 Dog의 자식 클래스이기 때문)
//		addDog(puppyList);
		
		//각 리스트에 들어있는 객체의 메서드 호출하기
		System.out.println("animalList : ");
		for(Object o : animalList) {
			((Animal)o).speak();
		}
	}
}
