package ex1_generic.exam3;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
	public static void main(String[] args) {
		List<Dog> dogs = new ArrayList<Dog>();
		List<Cat> cats = new ArrayList<Cat>();
		
		AnimalPrint ap = new AnimalPrint();
		
		ap.printAnimal(cats);
		ap.printAnimal(dogs);
		
		List<Integer> a = Arrays.asList(1,2,3,4,5);
		List<Double> b = Arrays.asList(1.0,2.4,3.4,4.5,5.5);
		
	}
	
	public static double sum(List<? extends Number> list) {
		double total = 0;
			for(Number n : list) {
				total +=n.doubleValue();
			}
			return total;
	}
}
