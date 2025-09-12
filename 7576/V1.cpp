#include <iostream>

bool aging(int *arr, int rows, int cols);
int dayCheck(int *arr, int rows, int cols);
int aroundCheck(int *arr, int rows, int cols, int x, int y);

// void printArray(int *arr, int rows, int cols)
// {
//   std::cout << std::endl;
//   for (int i = 0; i < rows; ++i)
//   {
//     for (int j = 0; j < cols; ++j)
//     {
//       std::cout << arr[i * cols + j] << ' ';
//     }
//     std::cout << '\n';
//   }
//   std::cout << std::endl;
// }

int main()
{
  int x, y;
  std::cin >> y >> x;
  int tomato[x][y];
  for (int i = 0; i < x; i++)
  {
    for (int j = 0; j < y; j++)
    {
      std::cin >> tomato[i][j];
    }
  }

  while (aging(&tomato[0][0], x, y))
  {
    // std::cout << "aging" << std::endl;
    // printArray(&tomato[0][0], x, y);
  }

  std::cout << dayCheck(&tomato[0][0], x, y) << std::endl;

  return 0;
}

bool aging(int *arr, int rows, int cols)
{
  // std::cout << arr[4 * cols + (6 - 1)] << std::endl;
  bool changed = false;

  for (int i = 0; i < rows; i++)
  {
    for (int j = 0; j < cols; j++)
    {
      int initVal = arr[i * cols + j];
      if (initVal == -1 || initVal == 1)
      {
        continue;
      }
      int around = aroundCheck(arr, rows, cols, i, j);
      if (initVal == 0 && around == 0)
      {
        continue;
      }
      if (initVal == 0 && around > 0)
      {
        arr[i * cols + j] = around + 1;
        changed = true;
        continue;
      }
      if (initVal != around + 1)
      {
        arr[i * cols + j] = around + 1;
        changed = true;
      }
    }
  }
  return changed;
}

int aroundCheck(int *arr, int rows, int cols, int x, int y)
{
  int U = 0;
  int D = 0;
  int L = 0;
  int R = 0;
  if (x != 0) // 상
  {
    U = arr[(x - 1) * cols + (y)];
  }
  if (x != rows - 1) // 하
  {
    D = arr[(x + 1) * cols + (y)];
  }
  if (y != 0) // 좌
  {
    L = arr[(x)*cols + (y - 1)];
  }
  if (y != cols - 1) // 우
  {
    R = arr[(x)*cols + (y + 1)];
  }
  int min = 10000000;
  // std::cout << "U: " << U << " D: " << D << " L: " << L << " R: " << R << std::endl;

  if (U > 0) // 1~
  {
    if (U < min)
    {
      min = U;
    }
  }
  if (D > 0)
  {
    if (D < min)
    {
      min = D;
    }
  }
  if (L > 0)
  {
    if (L < min)
    {
      min = L;
    }
  }
  if (R > 0)
  {
    if (R < min)
    {
      min = R;
    }
  }

  if (min == 10000000)
  {
    return 0;
  }
  return min;
}

int dayCheck(int *arr, int rows, int cols)
{
  int maxDay = 0;
  for (int i = 0; i < rows; i++)
  {
    for (int j = 0; j < cols; j++)
    {
      if (arr[i * cols + j] > maxDay)
      {
        maxDay = arr[i * cols + j];
      }
      if (arr[i * cols + j] == 0)
      {
        return -1;
      }
    }
  }
  return maxDay - 1;
}