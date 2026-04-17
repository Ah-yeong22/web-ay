package exam0417;

public class Employee {
	String name;
	int salary;
	
	public Employee(String name, int salary) {
		this.name= name;
		this.salary=salary;
	}
	
	public void printInfo() {
		System.out.println("이름:"+ name + ",급여:" +salary);
	}
	public String getName() {
		return name;
	}
	public int getSalary() {
		return salary;
	}
}
