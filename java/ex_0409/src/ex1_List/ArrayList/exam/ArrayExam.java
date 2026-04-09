package ex1_List.ArrayList.exam;

import java.util.ArrayList;
import java.util.List;

public class ArrayExam {
	public static void main(String[] args) {
		List<Integer> list = new ArrayList<Integer>();
		
		int sum =0;
		while(list.size() <10) {
			int ran = (int)(Math.random()*30) +1;
		if(ran %2 == 1) {
			list.add(ran);
			sum += ran;
		}
		
		}
		System.out.println(list);
		System.out.println(sum);
	}
}
