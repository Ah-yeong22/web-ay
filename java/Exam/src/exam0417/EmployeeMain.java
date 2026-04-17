package exam0417;

import java.util.ArrayList;
import java.util.Collections;

public class EmployeeMain {
	public static void main(String[] args) {
		ArrayList<Employee> list = new ArrayList<>();
		
		list.add(new Employee("김철수",3500));
		list.add(new Employee("박민숙",5600));
		list.add(new Employee("김민수",8500));
		list.add(new Employee("최철민",6500));
		
		Collections.sort(list,(e1,e2) -> e1.getSalary() - e2.getSalary());
		System.out.println("===급여 높은 순===");
		for(Employee e : list){
			e.printInfo();
		}
		
		Collections.sort(list,(e1,e2)-> e1.getName().compareTo(e2.getName()));
		System.out.println("===이름 순===");
		for(Employee e : list) {
			e.printInfo();
		}
	}
}
