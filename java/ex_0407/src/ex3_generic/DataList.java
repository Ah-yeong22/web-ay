package ex3_generic;

//클래스에 제네릭을 부여하게 되면 ㅎ ㅐ당 클래스를 선언할 때 데이터 ㅅ타입을 부여하게 된다. 
public class DataList<T> {

	private Object[] data;
	private int size;
	private int defaultSize = 10;
	
	public DataList() {
		data = new Object [defaultSize];
	}
		
	public DataList(int size) {
		data = new Object[size];
	}
	
	
	public void add(Object value) {
		data[size++] = value;
	}
	public T get(int index) {
		return (T)data[index];
	}
	public int size() {
		return size;
	
	}
}
