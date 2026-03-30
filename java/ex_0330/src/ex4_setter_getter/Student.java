package ex4_setter_getter;

public class Student {
	private String name;
	private int age;
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	public void setage(int age) {
		if(age >= 0) {
			this.age = age;
		}else {
			System.out.println("잘못된 나이");
		}
		
	}
	public int getage() {
		return age;
	}
}
