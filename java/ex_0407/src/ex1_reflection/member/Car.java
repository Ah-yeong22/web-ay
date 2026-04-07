package ex1_reflection.member;

public class Car {

	private String model;
	private String owner;
	
	// 기본 생성자
	public Car() {
	}
	
	// 매개변수 생성자
	public Car(String model, String owner) {
		this.model = model;
		this.owner = owner;
	}

	// getter
	public String getModel() {
		return model;
	}

	public String getOwner() {
		return owner;
	}

	// setter
	public void setModel(String model) {
		this.model = model;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}
}
