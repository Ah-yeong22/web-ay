package ex1_lambda;

public class User {
	String name;
	int age;
	String city;
	
	public User(String name, int age, String city) {
		this.age=age;
		this.city=city;
		this.name=name;
	}
	public int getAge() {
		return age;
	}
	public String getCity() {
		return city;
	}
	public String getName() {
		return name;
	}
}
