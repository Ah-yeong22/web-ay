package ex1_stream;

import java.io.ObjectInputStream.GetField;

public class Member {
	int id;
	String name;
	String status;
	
	public Member(int id, String name, String status) {
		this.id=id;
		this.name=name;
		this.status=status;
	}
	
	public int getId() {
		return id;
	}
	public String getName() {
		return name;
	}
	public String getStatus() {
		return status;
	}
	@Override
	public String toString() {
		return "Member{id="+id+ ", name=" +name + ", status=" + status+"}";
	}
}
